import { FormEvent, useEffect, useState } from 'react';

import type { MatchVideo } from '@scrambleiq/shared';

import type { MatchesApi } from '../../matches-api';
import {
  hasMatchVideoValidationErrors,
  initialMatchVideoValues,
  MatchVideoFormValues,
  MatchVideoValidationErrors,
  toCreateMatchVideoDto,
  validateMatchVideoForm,
} from '../../match-video';

export interface VideoSeekRequest {
  timestamp: number;
  requestId: number;
}

interface UseMatchVideoProps {
  api: MatchesApi;
  matchId: string;
  seekRequest: VideoSeekRequest | null;
}

export function useMatchVideo({ api, matchId, seekRequest }: UseMatchVideoProps) {
  const [video, setVideo] = useState<MatchVideo | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoFormVisible, setIsVideoFormVisible] = useState(false);
  const [videoFormValues, setVideoFormValues] = useState<MatchVideoFormValues>(initialMatchVideoValues);
  const [videoFormErrors, setVideoFormErrors] = useState<MatchVideoValidationErrors>({});
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [videoSubmissionError, setVideoSubmissionError] = useState<string | null>(null);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadVideo = async () => {
      setIsLoadingVideo(true);
      setVideoError(null);
      setVideo(null);
      setVideoSubmissionError(null);
      setVideoFormErrors({});
      setVideoFormValues(initialMatchVideoValues);
      setIsVideoFormVisible(false);
      setIsEditingVideo(false);

      try {
        const fetchedVideo = await api.getMatchVideo(matchId);

        if (isMounted) {
          setVideo(fetchedVideo);
        }
      } catch {
        if (isMounted) {
          setVideoError(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingVideo(false);
        }
      }
    };

    void loadVideo();

    return () => {
      isMounted = false;
    };
  }, [api, matchId]);

  useEffect(() => {
    if (!seekRequest || !videoElement) {
      return;
    }

    videoElement.currentTime = seekRequest.timestamp;
    void videoElement.play().catch(() => undefined);
  }, [seekRequest, videoElement]);

  const submitVideo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateMatchVideoForm(videoFormValues);
    setVideoFormErrors(validationErrors);

    if (hasMatchVideoValidationErrors(validationErrors)) {
      return;
    }

    setIsSubmittingVideo(true);
    setVideoSubmissionError(null);

    try {
      const payload = toCreateMatchVideoDto(videoFormValues);
      const savedVideo = video ? await api.updateMatchVideo(video.id, payload) : await api.createMatchVideo(matchId, payload);
      setVideo(savedVideo);
      setIsVideoFormVisible(false);
      setIsEditingVideo(false);
      setVideoFormErrors({});
      setVideoFormValues(initialMatchVideoValues);
    } catch {
      setVideoSubmissionError('Unable to save match video metadata. Please try again.');
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const startEditVideo = () => {
    if (!video) {
      return;
    }

    setIsEditingVideo(true);
    setIsVideoFormVisible(true);
    setVideoFormValues({
      title: video.title,
      sourceType: video.sourceType,
      sourceUrl: video.sourceUrl,
      durationSeconds: video.durationSeconds !== undefined ? String(video.durationSeconds) : '',
      notes: video.notes ?? '',
    });
    setVideoFormErrors({});
    setVideoSubmissionError(null);
  };

  const deleteVideo = async () => {
    if (!video) {
      return;
    }

    setVideoSubmissionError(null);

    try {
      await api.deleteMatchVideo(video.id);
      setVideo(null);
      setIsEditingVideo(false);
      setVideoFormValues(initialMatchVideoValues);
      setIsVideoFormVisible(false);
    } catch {
      setVideoSubmissionError('Unable to remove match video metadata. Please try again.');
    }
  };

  const cancelVideoForm = () => {
    setIsVideoFormVisible(false);
    setIsEditingVideo(false);
    setVideoFormValues(initialMatchVideoValues);
    setVideoFormErrors({});
    setVideoSubmissionError(null);
  };

  return {
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
    showVideoForm: () => setIsVideoFormVisible(true),
  };
}
