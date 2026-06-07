// Demo-seed content for the /art page. Titles, media, and dimensions below
// are fictional placeholders used to preview the layout. Each piece renders
// as a monochrome CSS-generated tile (no image files) so the gallery has no
// broken assets before real artwork is supplied. Replace with real pieces —
// and swap `pattern` tiles for ArtImage entries — before launch.

export type ArtPattern =
  | 'stripes'
  | 'radial'
  | 'conic'
  | 'split'
  | 'grid'
  | 'halftone'
  | 'arc'
  | 'bars';

export type ArtAspect = '1/1' | '4/5' | '3/4' | '4/3';

export interface ArtPiece {
  title: string;
  year: number;
  medium: string;
  dimensions: string;
  pattern: ArtPattern;
  aspect: ArtAspect;
}

export const artIntro =
  'A running notebook of personal work — typographic studies, plotter drawings, and print experiments made between client projects. Unbriefed, monochrome, and usually for no one in particular.';

export const artPieces: ArtPiece[] = [
  {
    title: 'Standing Wave No. 4',
    year: 2025,
    medium: 'Pen plotter on cotton',
    dimensions: '50 × 70 cm',
    pattern: 'arc',
    aspect: '4/5',
  },
  {
    title: 'Grid Study (Erosion)',
    year: 2024,
    medium: 'Risograph, black on newsprint',
    dimensions: '42 × 59 cm',
    pattern: 'grid',
    aspect: '3/4',
  },
  {
    title: 'Null Set',
    year: 2025,
    medium: 'Ink and gouache',
    dimensions: '30 × 30 cm',
    pattern: 'radial',
    aspect: '1/1',
  },
  {
    title: 'Marginalia I',
    year: 2023,
    medium: 'Letterpress, blind impression',
    dimensions: '21 × 29 cm',
    pattern: 'stripes',
    aspect: '3/4',
  },
  {
    title: 'Field Recording',
    year: 2024,
    medium: 'Generative, inkjet',
    dimensions: '70 × 50 cm',
    pattern: 'halftone',
    aspect: '4/3',
  },
  {
    title: 'After Hours',
    year: 2025,
    medium: 'Charcoal on primed board',
    dimensions: '60 × 80 cm',
    pattern: 'split',
    aspect: '4/5',
  },
  {
    title: 'Tessellate',
    year: 2022,
    medium: 'Cut paper',
    dimensions: '40 × 40 cm',
    pattern: 'conic',
    aspect: '1/1',
  },
  {
    title: 'Long Exposure',
    year: 2024,
    medium: 'Cyanotype, toned to grey',
    dimensions: '28 × 35 cm',
    pattern: 'bars',
    aspect: '4/5',
  },
];
