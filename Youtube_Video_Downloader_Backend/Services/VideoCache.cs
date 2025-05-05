csharp
namespace YouVid.io___Youtube_Video_Downloader.Services
{
    using Microsoft.Extensions.Caching.Memory;

    public class VideoCache
    {
        private readonly IMemoryCache _cache;
        private readonly MemoryCacheEntryOptions _cacheEntryOptions;

        public VideoCache()
        {
            _cache = new MemoryCache(new MemoryCacheOptions());
            _cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(10));
        }

        public async Task<byte[]> GetOrCreateAsync(
            string cacheKey,
            Func<Task<byte[]>> factory,
            CancellationToken cancellationToken = default)
        {
            return await _cache.GetOrCreateAsync(
                cacheKey,
                async (cacheEntry) =>
                {
                    cacheEntry.SetOptions(_cacheEntryOptions);
                    return await factory();
                }
            );
        }
    }
}