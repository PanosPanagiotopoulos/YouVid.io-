using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.FileProviders;
using Serilog;
using Youtube_Video_Downloader_Backend.Services; // Use the correct namespace for VideoCache
using YouVid.io___Youtube_Video_Downloader.Services;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Youtube_Video_Downloader_Backend.Models; // Assuming DownloadQueueItem is in this namespace
using System.Text.Json;
using System.IO;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Logger //
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration) // Load configuration from appsettings.json
    .Enrich.FromLogContext() // Enrich logs with contextual information
    .CreateLogger();

// Use Serilog middleware to log using ILogger
builder.Host.UseSerilog();
// - Logger //

string port = "8080"; // Default to 7076 if PORT is not set
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(15);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(15);
});


// Configure CORS to allow requests from the API itself
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowApiRequests", policy =>
    {
        policy.WithOrigins(
                $"http://localhost:{port}",
                $"https://localhost:{port}",
                "https://youvidio-production.up.railway.app",
                $"https://youvidio-production.up.railway.app:{port}"
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// Video Chunks Cache with Eviction
builder.Services.AddSingleton<VideoCache>();
builder.Services.AddHostedService<CacheEvictionService>(); // Background service for eviction
builder.Services.AddSingleton<DownloadQueue>();
builder.Services.AddHostedService<DownloadProcessorService>(); // Background service for download queue

// DDOS Protection
// Add Rate Limiting Services
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services
builder.Services.AddScoped<YoutubeService>();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// Serve static files from wwwroot
app.UseStaticFiles();

// Serve Static Files from Angular Dist Folder
//var frontendPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())?.FullName ?? string.Empty, "Youtube_Video_Downloader_Frontend", "dist", "demo", "browser");
var frontendPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(frontendPath),
    RequestPath = ""
});

// Enable Middleware for Rate Limiting
app.UseIpRateLimiting();

app.UseHttpsRedirection();

app.UseRouting();

// Preflight Requests and Security Headers
app.Use(async (context, next) =>
{
    if (context.Request.Method == HttpMethods.Options)
    {
        context.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }

    // Update security headers
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("Content-Security-Policy",
    $"frame-ancestors https://youvidio-production.up.railway.app https://youvidio-production.up.railway.app:{port} http://localhost:{port} https://localhost:{port};");
    // Remove or update X-Frame-Options
    context.Response.Headers.Remove("X-Frame-Options");

    // Optionally set to SAMEORIGIN if needed
    context.Response.Headers.Append("X-Frame-Options", "SAMEORIGIN");
    await next();
});

// Apply CORS Policy
app.UseCors("AllowApiRequests");

app.UseAuthorization();

// Map API Controllers
app.MapControllers().RequireCors("AllowApiRequests");

// Catch-All Route for Angular
app.MapFallbackToFile("index.html", new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(frontendPath),
});

app.Run();

public class DownloadQueueItem
{
    public Guid Id { get; set; }
    public string VideoId { get; set; }
    public string Format { get; set; }
    public string Quality { get; set; }
    public string Status { get; set; } // pending, downloading, finished, error
    public string? ErrorMessage { get; set; }
}

public class DownloadQueue
{
    private readonly List<DownloadQueueItem> _queue = new List<DownloadQueueItem>();
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(0, 1); // To signal the background service
    private readonly ILogger<DownloadQueue> _logger;
    private const string QueueFileName = "downloadQueue.json";

    public DownloadQueue(ILogger<DownloadQueue> logger)
    {
        _logger = logger;
        LoadQueue();
    }

    public void AddVideoToQueue(DownloadQueueItem item)
    {
        lock (_queue)
        {
            _queue.Add(item);
            SaveQueue();
            _logger.LogInformation($"Added video {item.VideoId} to the download queue. Current queue size: {_queue.Count}");
            _semaphore.Release(); // Signal the background service
        }
    }

    public void RemoveVideoFromQueue(Guid id)
    {
        lock (_queue)
        {
            var itemToRemove = _queue.FirstOrDefault(x => x.Id == id);
            if (itemToRemove != null)
            {
                _queue.Remove(itemToRemove);
                SaveQueue();
                _logger.LogInformation($"Removed video {id} from the download queue. Current queue size: {_queue.Count}");
            }
        }
    }

    public DownloadQueueItem? GetVideoStatus(Guid id)
    {
        lock (_queue)
        {
            return _queue.FirstOrDefault(x => x.Id == id);
        }
    }

    public List<DownloadQueueItem> GetAllVideosInQueue()
    {
        lock (_queue)
        {
            return _queue.ToList();
        }
    }

    public void UpdateVideoStatus(Guid id, string status, string? errorMessage = null)
    {
        lock (_queue)
        {
            var itemToUpdate = _queue.FirstOrDefault(x => x.Id == id);
            if (itemToUpdate != null)
            {
                itemToUpdate.Status = status;
                itemToUpdate.ErrorMessage = errorMessage;
                SaveQueue();
                _logger.LogInformation($"Updated status for video {id} to {status}");
            }
        }
    }

    public async Task<DownloadQueueItem?> DequeueAsync(CancellationToken cancellationToken)
    {
        await _semaphore.WaitAsync(cancellationToken);
        lock (_queue)
        {
            var nextItem = _queue.FirstOrDefault(x => x.Status == "pending");
            if (nextItem != null)
            {
                return nextItem;
            }
            return null;
        }
    }

    private void SaveQueue()
    {
        var json = JsonSerializer.Serialize(_queue);
        File.WriteAllText(QueueFileName, json);
    }

    private void LoadQueue()
    {
        if (File.Exists(QueueFileName))
        {
            var json = File.ReadAllText(QueueFileName);
            var loadedQueue = JsonSerializer.Deserialize<List<DownloadQueueItem>>(json);
            if (loadedQueue != null)
            {
                lock (_queue)
                {
                    _queue.AddRange(loadedQueue);
                    // Resume any interrupted downloads as pending
                    foreach(var item in _queue.Where(x => x.Status == "downloading"))
                    {
                        item.Status = "pending";
                    }
                     // Signal the semaphore for each pending item to start processing
                    int pendingCount = _queue.Count(item => item.Status == "pending");
                    if (pendingCount > 0)
                    {
                         _semaphore.Release(pendingCount);
                    }
                }
                 _logger.LogInformation($"Loaded {loadedQueue.Count} items from queue file.");
            }
        }
    }
}

public class DownloadProcessorService : BackgroundService
{
    private readonly DownloadQueue _downloadQueue;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<DownloadProcessorService> _logger;

    public DownloadProcessorService(DownloadQueue downloadQueue, IServiceScopeFactory serviceScopeFactory, ILogger<DownloadProcessorService> logger)
    {
        _downloadQueue = downloadQueue;
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Download Processor Service started.");
        while (!stoppingToken.IsCancellationRequested)
        {
            var nextItem = await _downloadQueue.DequeueAsync(stoppingToken);
            if (nextItem != null)
            {
                _logger.LogInformation($"Processing download for video: {nextItem.VideoId}");
                _downloadQueue.UpdateVideoStatus(nextItem.Id, "downloading");
                try
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                         var youtubeService = scope.ServiceProvider.GetRequiredService<YoutubeService>();
                         // Implement the actual download logic here
                         // This will likely involve calling the YoutubeService to download the video
                         // and saving it to a temporary location or streaming it.
                         // For now, let's simulate a download.
                         await Task.Delay(5000, stoppingToken); // Simulate download time

                         // Assuming download is successful
                         _downloadQueue.UpdateVideoStatus(nextItem.Id, "finished");
                         _logger.LogInformation($"Finished downloading video: {nextItem.VideoId}");
                    }
                }
                catch (Exception ex)
                {
                     _logger.LogError(ex, $"Error downloading video {nextItem.VideoId}");
                     _downloadQueue.UpdateVideoStatus(nextItem.Id, "error", ex.Message);
                }
            }
        }
         _logger.LogInformation("Download Processor Service stopped.");
    }
}