# YouTube Video Downloader

This application allows you to download YouTube videos by providing a URL. It processes the video and audio streams, merges them, and returns the enhanced video file.

## Features

- Extracts video ID from YouTube URLs
- Downloads video and audio streams separately
- Merges video and audio streams using FFmpeg
- Returns the enhanced video file

## Prerequisites

- .NET SDK
- Node.js and Angular CLI
- FFmpeg

## Project Structure

- `Youtube_Video_Downloader_Backend`: The .NET API Project
- `Youtube_Video_Downloader_Frontend`: The Angular Project


## API Endpoints

### Download Video

- **URL:** `/api/video/download`
- **Method:** `GET`
- **Query Parameter:** `url` (The URL of the video to download)
- **Response:** The downloaded video file


### VideoProcessingService.cs

- **Get(string videoId):** Fetches video and audio streams, merges them, and returns the enhanced video file.
- **GetYoutubeVideoIdFromUrl(string url):** Extracts the video ID from a YouTube URL.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [YouTubeExplode](https://github.com/Tyrrrz/YoutubeExplode) for fetching YouTube video information and streams.
- [FFmpeg](https://ffmpeg.org/) for merging video and audio streams.

## Contact

For any inquiries or issues, please contact the project maintainer.
