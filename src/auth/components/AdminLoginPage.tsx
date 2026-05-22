import { type FormEvent, useState } from 'react'
import { Button } from '../../components/actions/Button'
import { ErrorBanner } from '../../components/feedback/ErrorBanner'
import { LoadingState } from '../../components/feedback/LoadingState'
import { PageHeader } from '../../components/layout/PageHeader'
import { PagePanel } from '../../components/layout/PagePanel'
import { useAuth } from '../hooks/useAuth'
import './auth.css'

export function AdminLoginPage() {
  const { isCheckingAuth, login, loginErrorMessage } = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await login(loginId, password)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-auth-layout">
      <PagePanel className="admin-auth-panel">
        {isCheckingAuth ? (
          <LoadingState title="認証状態を確認中です" description="管理者セッションを確認しています。" />
        ) : (
          <>
            <PageHeader
              kicker="Admin login"
              title="管理者ログイン"
              description="履歴と商品管理は管理者のみアクセスできます。"
            />

            {loginErrorMessage ? (
              <ErrorBanner title="ログインに失敗しました" message={loginErrorMessage} />
            ) : null}

            <form className="admin-auth-form" onSubmit={handleSubmit}>
              <label className="admin-auth-field">
                <span>ログインID</span>
                <input
                  type="text"
                  className="admin-input"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  autoComplete="username"
                />
              </label>

              <label className="admin-auth-field">
                <span>パスワード</span>
                <input
                  type="password"
                  className="admin-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>

              <Button
                type="submit"
                variant="primary"
                className="px-4 py-2"
                disabled={isSubmitting || loginId.trim() === '' || password === ''}
              >
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>
          </>
        )}
      </PagePanel>
    </div>
  )
}
