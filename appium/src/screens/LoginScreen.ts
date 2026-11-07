import { byDesc } from '../support/selectors.js'
import { BaseScreen } from './BaseScreen.js'

class LoginScreen extends BaseScreen {
  protected readonly anchor = byDesc('Tap to login with given credentials')

  async login(user: { username: string; password: string }) {
    await this.type('nameET', user.username)
    await this.type('passwordET', user.password)
    await this.tapAfterScroll('loginBtn')
  }

  async usernameError(): Promise<string | null> {
    return (await this.el('nameErrorTV').isDisplayed()) ? this.textOf('nameErrorTV') : null
  }

  async passwordError(): Promise<string | null> {
    return (await this.el('passwordErrorTV').isDisplayed()) ? this.textOf('passwordErrorTV') : null
  }
}

export const loginScreen = new LoginScreen()
