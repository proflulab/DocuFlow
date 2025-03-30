declare module 'html-to-docx' {
  interface HTMLToDocxOptions {
    table?: {
      row?: {
        cantSplit?: boolean;
      };
    };
    footer?: boolean;
    pageNumber?: boolean;
  }

  export default function HTMLToDocx(
    htmlString: string,
    headerHTMLString: string | null,
    options?: HTMLToDocxOptions
  ): Promise<Buffer>;
}