import { Col, Row } from 'react-bootstrap';
import PageMetaData from '@/components/PageTitle';
import Conversions from './components/Conversions';
import SessionByBrowser from './components/SessionByBrowser';
import Stats from './components/Stats';
import TopPages from './components/TopPages';
import { useAuthContext } from '../../../../context/useAuthContext';
export default function Home() {
  const { user } = useAuthContext();

  return <>
      <PageMetaData title="Dashboard" />

      <Stats />
      {/* <Row>
        <Col>
          <Conversions />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <SessionByBrowser />
        </Col>
        <Col lg={6}>
          <TopPages />
        </Col>
      </Row> */}
    </>;
}