import type { MatchesApi } from '../../matches-api';

import { VideoMetadataForm } from './VideoMetadataForm';
import type { VideoSeekRequest } from './useMatchVideo';
import { useMatchVideo } from './useMatchVideo';

interface VideoPanelProps {
  api: MatchesApi;
  matchId: string;
  seekRequest: VideoSeekRequest | null;
  onVideoMetadataMutated: () => void;
}

export function VideoPanel({ api, matchId, seekRequest, onVideoMetadataMutated }: VideoPanelProps) {
  const {
    video,
    isLoadingVideo,
    videoError,
    isVideoFormVisible,
    videoFormValues,
    videoFormErrors,
    isSubmittingVideo,
    videoSubmissionError,
    isEditingVideo,
    setVideoElement,
    setVideoFormValues,
    submitVideo,
    startEditVideo,
    deleteVideo,
    cancelVideoForm,
    showVideoForm,
  } = useMatchVideo({ api, matchId, seekRequest, onVideoMetadataMutated });

  return (
    <section aria-labelledby="video-review-heading">
      <h2 id="video-review-heading">Video Review</h2>

      {isLoadingVideo ? <p>Loading video metadata...</p> : null}
      {videoError ? <p className="status-error">{videoError}</p> : null}

      {!isLoadingVideo && !video ? <p>No video attached yet.</p> : null}

      {!isLoadingVideo && video ? (
        <>
          <video controls src={video.sourceUrl} onLoadedMetadata={(event) => setVideoElement(event.currentTarget)} data-testid="match-video-player" />
          <p>Title: {video.title}</p>
          <p>Source type: {video.sourceType}</p>
          <p>Source URL: {video.sourceUrl}</p>
          {video.durationSeconds !== undefined ? <p>Duration (seconds): {video.durationSeconds}</p> : null}
          {video.notes ? <p>Notes: {video.notes}</p> : null}
          {!isVideoFormVisible ? (
            <div className="button-row">
              <button type="button" onClick={startEditVideo}>
                Edit Video
              </button>
              <button type="button" onClick={() => void deleteVideo()}>
                Remove Video
              </button>
            </div>
          ) : null}
        </>
      ) : null}

      {!isVideoFormVisible ? (
        <div className="button-row">
          <button type="button" onClick={showVideoForm}>
            {video ? 'Update Video Metadata' : 'Attach Video'}
          </button>
        </div>
      ) : null}

      {isVideoFormVisible ? (
        <VideoMetadataForm
          values={videoFormValues}
          errors={videoFormErrors}
          isSubmitting={isSubmittingVideo}
          isEditing={isEditingVideo}
          submissionError={videoSubmissionError}
          onChange={setVideoFormValues}
          onSubmit={submitVideo}
          onCancel={cancelVideoForm}
        />
      ) : null}
    </section>
  );
}
