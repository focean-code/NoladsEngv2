
import React from 'react';
import { H1, H2, H3, H4, P, Display, Quote, Code } from '@/components/ui';

const TypographyDemoPage = () => {
  return (
    <div className="container mx-auto p-8">
      <Display>Typography Showcase</Display>

      <div className="mt-12">
        <H1>This is an H1 heading</H1>
        <P className="mt-2">This is a paragraph of text that follows the H1 heading. It provides a brief introduction to the section.</P>
      </div>

      <div className="mt-12">
        <H2>This is an H2 heading</H2>
        <P className="mt-2">This is a paragraph of text that follows the H2 heading. It provides more detailed information about the topic.</P>
      </div>

      <div className="mt-12">
        <H3>This is an H3 heading</H3>
        <P className="mt-2">This is a paragraph of text that follows the H3 heading. It can be used for sub-sections or to highlight key points.</P>
      </div>

      <div className="mt-12">
        <H4>This is an H4 heading</H4>
        <P className="mt-2">This is a paragraph of text that follows the H4 heading. It is suitable for less important headings or labels.</P>
      </div>

      <div className="mt-12">
        <Quote>This is a quote. It is rendered in a serif font and has a distinct style to make it stand out from the rest of the text.</Quote>
      </div>

      <div className="mt-12">
        <P>This is a regular paragraph of text. It uses the default paragraph style. You can also have <Code>inline code</Code> within your text.</P>
        <P variant="lead" className="mt-4">This is a lead paragraph. It is slightly larger and is used to draw attention to the beginning of a section.</P>
        <P variant="small" className="mt-4">This is a small paragraph. It is suitable for captions, footnotes, or other less prominent text.</P>
      </div>
    </div>
  );
};

export default TypographyDemoPage;
