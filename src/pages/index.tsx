import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from "react-icons/fi";

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [pagination, setPagination] = useState<string>(postsPagination.next_page);

  function loadMorePosts(link: string | null){
    if(pagination){
      fetch(link)
      .then(response => response.json())
      .then(data => {
        const newPosts = data.results.map(result => {

          return {
            uid: result.uid,
            first_publication_date: result.first_publication_date,
            data: {
              title: result.data.title,
              subtitle: result.data.subtitle,
              author: result.data. author,
            }
          }
        })

        setPosts([...posts, ...newPosts])
        setPagination(data.next_page)
      })
    }

  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main className={commonStyles.mainContainer}>
        <Header/>

        <section className={styles.section}>

          <div className={styles.posts}>
            { posts.map(post => (
              <div key={post.uid}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <h1>{post.data.title}</h1>
                  </a>
                </Link>
                <p>{post.data.subtitle}</p>
                <div className={styles.postFooter}>
                  <p><FiCalendar/><time>{
                  format( new Date(post.first_publication_date), "d MMM yyyy",
                  {
                    locale: ptBR,
                  })
                  }</time></p>

                  <p><FiUser/>{post.data.author}</p>
                </div>
              </div>
            )) }
          </div>

          { pagination ? <button type='button' onClick={() => loadMorePosts(pagination)}>Carregar mais posts</button> : null }

        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    },
  }
};
