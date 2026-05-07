import { useEffect } from 'react';

const pageTitles = {
  '/home': 'Middle East Engineering Construction | Home',
  '/whatwedo': 'What We Do | Middle East Engineering Construction',
  '/project': 'Our Projects | Middle East Engineering Construction',
  '/contact': 'Contact Us | Middle East Engineering Construction',
};

const defaultTitle = 'Middle East Engineering Construction | MMSR SPC';

const PageTitle = ({ pathname }) => {
  useEffect(() => {
    const title = pageTitles[pathname] || defaultTitle;
    document.title = title;
  }, [pathname]);

  return null;
};

export default PageTitle;