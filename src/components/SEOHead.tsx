import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  pageType?: 'homepage' | 'board' | 'generic';
  boardId?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Notes Board - Real-time Collaborative Workspace',
  description = 'Create and collaborate on digital notes in real-time. Powered by HPKV\'s ultra-fast WebSocket API and Zustand state management. Share boards instantly with your team.',
  image = '/og-image.png',
  noIndex = false,
  pageType = 'generic',
  boardId
}) => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://notes-board.demo';
  const fullUrl = `${baseUrl}${router.asPath}`;

  // Generate contextually appropriate structured data
  const getStructuredData = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "url": fullUrl,
      "name": title,
      "description": description,
      "image": `${baseUrl}${image}`,
      "creator": {
        "@type": "Organization",
        "name": "HPKV",
        "url": "https://hpkv.io",
        "logo": `${baseUrl}/logo.png`,
        "sameAs": [
          "https://github.com/hpkv-io",
          "https://hpkv.io"
        ]
      }
    };

    switch (pageType) {
      case 'homepage':
        return {
          ...baseSchema,
          "@type": "WebApplication",
          "applicationCategory": "BusinessApplication",
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "permissions": "clipboard-read, clipboard-write",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "featureList": [
            "Real-time collaboration",
            "Drag and drop notes",
            "Multi-user live cursors",
            "Instant synchronization",
            "Responsive design"
          ],
        };

      case 'board':
        return {
          ...baseSchema,
          "@type": "CreativeWork",
          "@id": `${baseUrl}/boards/${boardId}`,
          "identifier": boardId,
          "isPartOf": {
            "@type": "WebApplication",
            "name": "Notes Board",
            "url": baseUrl
          },
          "interactivityType": "active",
          "learningResourceType": "collaborative workspace",
          "audience": {
            "@type": "Audience",
            "audienceType": "business teams, students, collaborators"
          }
        };

      default:
        return {
          ...baseSchema,
          "@type": "WebPage",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Notes Board",
            "url": baseUrl
          },
          "primaryImageOfPage": {
            "@type": "ImageObject",
            "contentUrl": `${baseUrl}${image}`,
            "description": "Notes Board application interface"
          }
        };
    }
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#667eea" />
      <meta name="msapplication-TileColor" content="#667eea" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={pageType === 'board' ? 'article' : 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={`${baseUrl}${image}`} />
      <meta property="og:image:alt" content="Notes Board - Real-time Collaborative Workspace" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Notes Board" />
      <meta property="og:locale" content="en_US" />
      
      {pageType === 'board' && boardId && (
        <>
          <meta property="article:author" content="Notes Board Users" />
          <meta property="article:section" content="Collaboration" />
          <meta property="article:tag" content="notes,collaboration,real-time" />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}${image}`} />
      <meta name="twitter:image:alt" content="Notes Board interface screenshot" />
      <meta name="twitter:site" content="@hpkv_io" />
      <meta name="twitter:creator" content="@hpkv_io" />

      {/* Additional SEO Meta */}
      <meta name="author" content="HPKV" />
      <meta name="keywords" content="notes, collaboration, real-time, multiplayer, zustand, state management, HPKV, sticky notes, demo, WebSocket" />
      <meta name="application-name" content="CollaborativeNotes Board" />
      <meta name="generator" content="Next.js" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={fullUrl} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData())
        }}
      />

      {pageType === 'board' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": baseUrl
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Boards",
                  "item": `${baseUrl}/boards`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": `Board ${boardId?.slice(0, 8)}...`,
                  "item": fullUrl
                }
              ]
            })
          }}
        />
      )}
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Head>
  );
}; 