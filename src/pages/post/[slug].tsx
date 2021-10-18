import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import Image from 'next/image'
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import React from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  const router = useRouter()

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>

      <main className={styles.mainContainer}>
        <Header/>

        <section className={commonStyles.containerContent}>

          <div className={styles.post}>
            <Image src={post.data.banner.url} width={700} height={400} />
            <h1>{post.data.title}</h1>

            <div className={styles.postFooter}>
              <p><FiCalendar/>
                <time>{format(new Date(post.first_publication_date), "d MMM yyyy",
                  {
                    locale: ptBR,
                  })}
                </time>
              </p>
              <p><FiUser/>{post.data.author}</p>
              <p><FiClock/>2 min</p>
            </div>

            { post.data.content.map(post => {
                return (
                  <div key={post.heading} className={styles.postContent}>
                    <h2>{post.heading}</h2>
                    <article
                      dangerouslySetInnerHTML={{ __html: RichText.asHtml(post.body) }}
                    ></article>
                  </div>
                )
            }) }
          </div>

        </section>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 100,
  });

  const paths = posts.results.map(post => {
    return {
      params: {slug: post.uid}
    }
  })

  return {
    // Only `/posts/1` and `/posts/2` are generated at build time
    //paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
    paths,
    // Enable statically generating additional pages
    // For example: `/posts/3`
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  //console.log(JSON.stringify(response.data.content.body,null,1))

  // const post = {
  //   first_publication_date: response.first_publication_date,
  //   data: {
  //     title: response.data.title,
  //     banner: {
  //       url: response.data.banner.url,
  //     },
  //     author: response.data.author,
  //     content: {
  //       // heading: response.data.content.heading,
  //       // body: {
  //       //   text: response.data.content.body.text,
  //       // },
  //     },
  //   },
  // }

  //console.log(JSON.stringify(post,null,1))

  return {
    props: {
      post: response,
    },
    revalidate: 1 * 1 * 1, // 30m = second * minute * hour
  }
};
