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
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services
builder.Services.AddScoped<VideoProcessingService>();


WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//app.UseStaticFiles(); // Serve static files from wwwroot by default

// Serve Static Files from Angular Dist Folder**
/*app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory()).FullName, "E-Commerce-Application-UI", "dist", "e-commerce-app", "browser")),
    RequestPath = ""
}); */

// **Add Routing**
//app.UseRouting(); 

// Add cores to the project
app.UseCors();


app.UseAuthorization();

app.MapControllers();
// **Map API Controllers**
//app.UseEndpoints(endpoints =>
//{
/*    endpoints.MapControllers();

    // **Catch-All Route for Angular**
    endpoints.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory()).FullName, "E-Commerce-Application-UI", "dist", "e-commerce-app", "browser")),
    });
});*/


app.Run();
