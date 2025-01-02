using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Server.Kestrel.Core;
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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5000", "https://localhost:5001", "https://localhost:443", "https://localhost:80")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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


builder.WebHost.UseUrls("http://0.0.0.0:7076");


WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// Enable Middleware for Rate Limiting
app.UseIpRateLimiting();

app.UseHttpsRedirection();

// Preflight Requests and Security Headers
app.Use(async (context, next) =>
{
    if (context.Request.Method == HttpMethods.Options)
    {
        context.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }

    // Update security headers
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("Content-Security-Policy",
    "frame-src http://localhost:5000 https://localhost:5001 http://localhost:7076;");
    context.Response.Headers.Add("X-Frame-Options", "ALLOW-FROM http://localhost:5000");
    await next();
});

// Apply CORS Policy
app.UseCors("AllowFrontend");


app.UseAuthorization();

app.MapControllers();

app.Run();
