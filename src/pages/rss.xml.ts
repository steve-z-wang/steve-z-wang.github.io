import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  return rss({
    title: 'sw.log',
    description: "Steve Wang's Blog: Thoughts on technology, learning, and building things",
    site: context.site!.href,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.summary,
      link: `/posts/${post.id}`,
    })),
  });
}
