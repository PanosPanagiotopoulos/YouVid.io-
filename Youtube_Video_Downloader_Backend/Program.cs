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


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:5000") // Frontend origin
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services
builder.Services.AddScoped<VideoProcessingService>();

builder.WebHost.UseUrls("http://0.0.0.0:7076");


WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();


// Add cores to the project
app.UseCors();


app.UseAuthorization();

app.MapControllers();

app.Run();
