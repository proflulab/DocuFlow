declare module 'html-to-docx' {
  interface HTMLToDocxOptions {
    table?: {
      row?: {
        cantSplit?: boolean;
        widths?: number[];
        height?: number;
      };
      borders?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
      alignment?: 'left' | 'center' | 'right';
      style?: {
        backgroundColor?: string;
        color?: string;
      };
    };
    footer?: boolean;
    pageNumber?: boolean;
    font?: {
      family?: string;
      size?: number;
      color?: string;
    };
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    orientation?: 'portrait' | 'landscape';
    spacing?: {
      before?: number;
      after?: number;
      line?: number;
    };
    styles?: {
      paragraphStyles?: {
        alignment?: 'left' | 'center' | 'right' | 'justify';
        indentation?: {
          left?: number;
          right?: number;
          firstLine?: number;
        };
      };
      textStyles?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        color?: string;
        backgroundColor?: string;
      };
    };
  }

  export default function HTMLToDocx(
    htmlString: string,
    headerHTMLString: string | null,
    options?: HTMLToDocxOptions
  ): Promise<Buffer>;
}