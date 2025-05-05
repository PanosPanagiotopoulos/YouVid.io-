using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;
using Serilog;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Youtube_Video_Downloader_Backend.Models; // Assuming DownloadQueueItem is in this namespace
using Youtube_Video_Downloader_Backend.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

string port = builder.Configuration["PORT"] ?? "8080";
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.ListenAnyIP(int.Parse(port)); // Listen on the specified port
});

// Logger //
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration) // Load configuration from appsettings.json
    .CreateLogger();

// Configure CORS
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

// Add Serilog middleware to log using ILogger
builder.Host.UseSerilog();
// Services
builder.Services.AddScoped<YoutubeService>();
builder.Services.AddSingleton<VideoCache>();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
app.UseStaticFiles();
var frontendPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(frontendPath),
    RequestPath = ""
});

app.UseIpRateLimiting();

app.UseHttpsRedirection();
app.UseRouting(); // Place UseRouting here
// Preflight Requests and Security Headers
app.Use(async (context, next) => {
    if (context.Request.Method == HttpMethods.Options)
    {
        context.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }

    // Update security headers
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("Content-Security-Policy",
    $"frame-ancestors https://youvidio-production.up.railway.app https://youvidio-production.up.railway.app:{port} http://localhost:{port} https://localhost:{port};");
    context.Response.Headers.Remove("X-Frame-Options");

    context.Response.Headers.Append("X-Frame-Options", "SAMEORIGIN");
});
app.UseAuthentication(); // Add Authentication middleware here if needed

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
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(0); // To signal the background service
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
                } // Signal the semaphore for each pending item to start processing
                 // Signal the semaphore for each pending item to start processing
                int pendingCount = _queue.Count(item => item.Status == "pending");
                _semaphore.Release(pendingCount);
            }
        }
    }
}