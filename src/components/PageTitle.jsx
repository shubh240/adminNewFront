import { Helmet } from 'react-helmet-async';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';
const PageMetaData = ({
  title
}) => {
  const defaultTitle = DEFAULT_PAGE_TITLE;
  return <Helmet>
      <title>{title ? `${title} | Clozzet Seller Admin` : defaultTitle}</title>
    </Helmet>;
};
export default PageMetaData;