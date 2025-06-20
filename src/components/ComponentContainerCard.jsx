import clsx from 'clsx'
import { Card, CardBody, CardTitle } from 'react-bootstrap'
import { Link } from 'react-router-dom'
const ComponentContainerCard = ({ title, id, description, children, titleClass, descriptionClass, addButtonLink }) => {
  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <CardTitle as={'h3'} className={clsx('anchor mb-1', titleClass)} id={id}>
            {title}
            <a className="anchor-link" href={`#${id}`}>
              #
            </a>
          </CardTitle>
          {addButtonLink && (
            <Link to={addButtonLink} class="btn btn-primary">
              Add
            </Link>
          )}
        </div>
        {!!description && <p className={clsx('text-muted', descriptionClass)}>{description}</p>}
        <>{children}</>
      </CardBody>
    </Card>
  )
}
export default ComponentContainerCard
