namespace YouVid.io___Youtube_Video_Downloader.Models
{
    public class VideoDownloadSettings
    {
        public string? Url { get; set; }
        public string? VideoId { get; set; }

        public ProcessSettings Settings { get; set; }
    }
}
