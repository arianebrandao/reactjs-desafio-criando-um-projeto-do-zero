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
import { RichText } from 'prismic-dom';
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

  //console.log(postsPagination.next_page)

  // const pages = 'https://api.github.com/orgs/rocketseat/repos';
  // const [posts, setPosts] = useState<Post[]>([]);

  // useEffect(() => {
  //   fetch(pages)
  //   .then(response => response.json())
  //   .then(data => setPosts(data))
  // }, []);
  
  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main className={commonStyles.mainContainer}>
        <Header/>

        <section className={styles.section}>
          { postsPagination.next_page }

        <ul>
          {/* {
            posts.map(post => {
              return <li>{post.data.title}</li>
            })
          } */}
        </ul>

          <div className={styles.posts}>
            { postsPagination.results.map(post => (
              <div key={post.uid}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <h1>{post.data.title}</h1>
                  </a>
                </Link>
                <p>{post.data.subtitle}</p>
                <div className={styles.postFooter}>
                  {/* <p><FiCalendar/><time>{post.first_publication_date}</time></p> */}
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

          <button type='button'>Carregar mais posts</button>

        </section>
      </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  });

  const next_page = postsResponse.next_page;

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      // first_publication_date: format( new Date(post.first_publication_date), "d MMM yyyy",
      //   {
      //     locale: ptBR,
      //   }),
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  //console.log(JSON.stringify(postsPagination, null, 2))

  return {
    props: { 
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    },
  }
};
