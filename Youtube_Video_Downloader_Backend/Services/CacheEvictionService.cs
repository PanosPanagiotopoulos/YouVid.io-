csharp
namespace YouVid.io___Youtube_Video_Downloader.Services
{
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using System.Threading;
    using System.Threading.Tasks;

    public class CacheEvictionService : BackgroundService
    {
        private readonly ILogger<CacheEvictionService> _logger;

        public CacheEvictionService(ILogger<CacheEvictionService> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Cache Eviction Service started.");
            while (!stoppingToken.IsCancellationRequested)
            {
                //await EvictExpiredCacheItems(); // Implement cache eviction logic
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Check every minute
            }
            _logger.LogInformation("Cache Eviction Service stopped.");
        }
    }
}