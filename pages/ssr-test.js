// pages/ssr-test.js
export async function getServerSideProps() {
  console.log("--- SSR TEST PAGE LOG ---");
  return { props: { data: 'Hello from SSR!' } };
}

export default function SsrTest({ data }) {
  return <h1>{data}</h1>;
}