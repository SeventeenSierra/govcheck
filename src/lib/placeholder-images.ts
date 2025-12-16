import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// SPDX-License-Identifier: AGPL-3.0-or-later
export const MOCK_USER_AVATAR = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
