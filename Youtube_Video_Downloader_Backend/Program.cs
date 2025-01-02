using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.Extensions.FileProviders;
using Serilog;
using YouVid.io___Youtube_Video_Downloader.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Logger //
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration) // Load configuration from appsettings.json
    .Enrich.FromLogContext() // Enrich logs with contextual information
    .CreateLogger();

// Use Serilog middleware to log using ILogger
builder.Host.UseSerilog();
// - Logger //

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(8);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(8);

    options.ListenAnyIP(7076); // HTTP
    options.ListenAnyIP(7077, listenOptions =>
    {
        listenOptions.UseHttps("certificate.pfx", "panospan7");
    });
});

// Configure CORS to allow requests from the API itself
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowApiRequests", policy =>
    {
        policy.WithOrigins("http://localhost:7076", "https://localhost:7077")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

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

builder.WebHost.UseUrls("http://0.0.0.0:7076", "https://0.0.0.0:7077");

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
    "frame-src http://localhost:5000 https://localhost:5001 http://localhost:7076 http://localhost:7077 https://localhost:7077;");
    context.Response.Headers.Append("X-Frame-Options", "ALLOW-FROM http://localhost:5000 https://localhost:5001 http://localhost:7076 http://localhost:7077 https://localhost:7077");
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