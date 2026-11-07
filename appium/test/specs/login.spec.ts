import { $, expect } from '@wdio/globals'

import { USERS } from '../../src/data/users.js'
import { catalogScreen } from '../../src/screens/CatalogScreen.js'
import { header } from '../../src/screens/Header.js'
import { loginScreen } from '../../src/screens/LoginScreen.js'
import { freshApp } from '../../src/support/app.js'

describe('Login', () => {
  beforeEach(async () => {
    await freshApp()
    await catalogScreen.waitUntilShown()
    await header.goTo('Log In')
    await loginScreen.waitUntilShown()
  })

  it('@smoke a standard user logs in and lands on the catalog', async () => {
    await loginScreen.login(USERS.standard)

    await catalogScreen.waitUntilShown()
    await header.openMenu()
    // Logged in, the menu offers Log Out instead of Log In.
    await expect($('android=new UiSelector().text("Log Out")')).toBeDisplayed()
  })

  it('a locked-out user is refused with a clear message', async () => {
    await loginScreen.login(USERS.lockedOut)

    expect(await loginScreen.passwordError()).toBe('Sorry this user has been locked out.')
    expect(await loginScreen.isShown()).toBe(true)
  })

  it('an empty username is reported on the username field only', async () => {
    await loginScreen.login({ username: '', password: USERS.standard.password })

    expect(await loginScreen.usernameError()).toBe('Username is required')
    expect(await loginScreen.passwordError()).toBeNull()
  })

  it('an empty password is reported on the password field only', async () => {
    await loginScreen.login({ username: USERS.standard.username, password: '' })

    expect(await loginScreen.passwordError()).toBe('Enter Password')
    expect(await loginScreen.usernameError()).toBeNull()
  })
})
