import './feedback.css'

type ErrorBannerProps = {
  title: string
  message: string
}

export function ErrorBanner({ title, message }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-banner-icon" aria-hidden="true">
        !
      </span>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  )
}
