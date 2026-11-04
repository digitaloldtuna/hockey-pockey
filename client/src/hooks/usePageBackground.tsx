import { useEffect } from 'react';

// Paint the whole page, including the area you see when you over-scroll, in one colour.
// The theme's default is a light blue-grey, which shows up as a pale strip past the edges.
export function usePageBackground(colour: string) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = [html.style.backgroundColor, body.style.backgroundColor];
    html.style.backgroundColor = colour;
    body.style.backgroundColor = colour;
    return () => {
      html.style.backgroundColor = previous[0];
      body.style.backgroundColor = previous[1];
    };
  }, [colour]);
}
