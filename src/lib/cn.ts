import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge doesn't know about our custom design-system tokens, so it
// incorrectly treats `text-on-color` (a color utility) as conflicting with
// `text-body-sm` (a font-size utility). We extend the config to tell it which
// `text-*` tokens are font-size and which are color so they don't clobber each other.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'h1-mobile', 'h2-mobile', 'h3-mobile', 'h4-mobile', 'h5-mobile', 'h6-mobile',
            'body-lg', 'body', 'body-sm', 'caption',
          ],
        },
      ],
      'text-color': [
        {
          text: [
            'heading', 'body-emphasis', 'muted', 'placeholder', 'disabled', 'on-color',
            'primary', 'primary-hover', 'secondary', 'secondary-hover',
            'accent', 'error', 'info', 'success', 'warning',
            'icon', 'icon-primary', 'icon-primary-hover', 'icon-secondary',
            'icon-secondary-hover', 'icon-secondary-subtle', 'icon-secondary-subtle-hover',
            'icon-accent', 'icon-error', 'icon-info', 'icon-warning', 'icon-success',
            'icon-disabled', 'icon-on-color',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
