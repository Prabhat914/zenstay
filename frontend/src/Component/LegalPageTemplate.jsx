import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { authDataContext } from "../Context/AuthContext";

function LegalPageTemplate({ slug, fallbackTitle, fallbackContent }) {
  const { serverUrl } = useContext(authDataContext);
  const [title, setTitle] = useState(fallbackTitle);
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/legal/${slug}`);
        setTitle(result?.data?.title || fallbackTitle);
        setContent(result?.data?.content || fallbackContent);
      } catch (error) {
        setTitle(fallbackTitle);
        setContent(fallbackContent);
      }
    };
    fetchPage();
  }, [serverUrl, slug, fallbackTitle, fallbackContent]);

  return (
    <div className='w-[100vw] min-h-[100vh] bg-white px-[20px] py-[30px] md:px-[60px]'>
      <h1 className='text-[30px] text-black font-semibold'>{title}</h1>
      <p className='text-[17px] text-[#333] mt-[18px] max-w-[900px] whitespace-pre-line'>{content}</p>
      <Link to="/" className='inline-block mt-[30px] text-[red] text-[18px]'>Back to Home</Link>
    </div>
  );
}

export default LegalPageTemplate;

