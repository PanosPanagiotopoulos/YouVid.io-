using YoutubeExplode.Videos.Streams;

namespace YouVid.io___Youtube_Video_Downloader.Models
{

    public record VideoDownloadPreference(
    Container PreferredContainer,
    VideoQualityPreference PreferredVideoQuality
)
    {

    }
}