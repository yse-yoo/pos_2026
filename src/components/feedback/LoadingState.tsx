import './feedback.css'

type LoadingStateProps = {
  title: string
  description: string
}

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <div className="feedback-icon" aria-hidden="true">
        <span className="loading-spinner" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
