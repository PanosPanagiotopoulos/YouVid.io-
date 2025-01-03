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