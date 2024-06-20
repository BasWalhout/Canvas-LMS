/*
 * Copyright (C) 2024 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {useScope as useI18nScope} from '@canvas/i18n'
import {Button} from '@instructure/ui-buttons'
import {Modal} from '@instructure/ui-modal'
import React from 'react'
import type {AccountId} from '../model/AccountId'
import {mkUseDynamicRegistrationWizardState} from './DynamicRegistrationWizardState'
import type {DynamicRegistrationWizardService} from './DynamicRegistrationWizardService'
import {View} from '@instructure/ui-view'
import {Flex} from '@instructure/ui-flex'
import {Spinner} from '@instructure/ui-spinner'
import {showFlashAlert} from '@canvas/alerts/react/FlashAlert'
import {PermissionConfirmation} from './components/PermissionConfirmation'
import {PrivacyConfirmation} from './components/PrivacyConfirmation'

const I18n = useI18nScope('lti_registrations')

export type DynamicRegistrationWizardProps = {
  dynamicRegistrationUrl: string
  accountId: AccountId
  unregister: () => void
  service: DynamicRegistrationWizardService
}

export const DynamicRegistrationWizard = (props: DynamicRegistrationWizardProps) => {
  const {accountId, dynamicRegistrationUrl, service} = props
  const useDynamicRegistrationWizardState = React.useMemo(
    () => mkUseDynamicRegistrationWizardState(service),
    [service]
  )
  const dynamicRegistrationWizardState = useDynamicRegistrationWizardState()

  const {loadRegistrationToken} = dynamicRegistrationWizardState

  React.useEffect(() => {
    loadRegistrationToken(accountId, dynamicRegistrationUrl)
  }, [accountId, dynamicRegistrationUrl, loadRegistrationToken])

  const state = dynamicRegistrationWizardState.state

  switch (state._type) {
    case 'RequestingToken':
      return (
        <>
          <Modal.Body>
            <View as="div" height="20rem" data-testid="dynamic-reg-modal-loading-registration">
              <Flex justifyItems="center" alignItems="center" height="100%">
                <Flex.Item>
                  <Spinner renderTitle={I18n.t('Loading')} />
                </Flex.Item>
                <Flex.Item>{I18n.t('Loading')}</Flex.Item>
              </Flex>
            </View>
          </Modal.Body>
          <Modal.Footer>
            <Button color="secondary" type="submit" onClick={props.unregister}>
              {I18n.t('Cancel')}
            </Button>
            <Button margin="small" color="primary" type="submit" disabled={true}>
              {I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'WaitingForTool':
      return (
        <>
          <iframe
            src={addParams(props.dynamicRegistrationUrl, {
              openid_configuration: state.registrationToken.oidc_configuration_url,
              registration_token: state.registrationToken.token,
            })}
            style={{width: '100%', height: '600px', border: '0', display: 'block'}}
            title={I18n.t('Register App')}
            data-testid="dynamic-reg-wizard-iframe"
          />
          <Modal.Footer>
            <Button color="secondary" type="submit" onClick={props.unregister}>
              {I18n.t('Cancel')}
            </Button>
            <Button margin="small" color="primary" type="submit" disabled={true}>
              {I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'LoadingRegistration':
      return (
        <Modal.Body>
          <View as="div" height="20rem" data-testid="dynamic-reg-modal-loading-registration">
            <Flex justifyItems="center" alignItems="center" height="100%">
              <Flex.Item>
                <Spinner renderTitle={I18n.t('Loading')} />
              </Flex.Item>
              <Flex.Item>{I18n.t('Loading Registration')}</Flex.Item>
            </Flex>
          </View>
        </Modal.Body>
      )
    case 'PermissionConfirmation':
      return (
        <>
          <Modal.Body>
            <PermissionConfirmation
              registration={state.registration}
              overlayStore={state.overlayStore}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              margin="small"
              color="secondary"
              type="submit"
              disabled={false}
              onClick={async () => {
                props.unregister()
                const result = await dynamicRegistrationWizardState.deleteKey(
                  state._type,
                  state.registration.developer_key_id
                )
                if (result._type !== 'success') {
                  showFlashAlert({
                    message: I18n.t(
                      'Something went wrong deleting the registration. The registration can still be deleted manually on the Manage page.'
                    ),
                    type: 'error',
                  })
                }
              }}
            >
              {I18n.t('Cancel')}
            </Button>
            <Button
              margin="small"
              color="primary"
              type="submit"
              onClick={() => {
                dynamicRegistrationWizardState.transitionToConfirmationState(
                  state._type,
                  'PrivacyLevelConfirmation'
                )
              }}
            >
              {I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'PrivacyLevelConfirmation':
      return (
        <>
          <Modal.Body>
            <PrivacyConfirmation
              overlayStore={state.overlayStore}
              toolName={state.registration.client_name}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="secondary"
              type="submit"
              onClick={() => {
                dynamicRegistrationWizardState.transitionToConfirmationState(
                  state._type,
                  'PermissionConfirmation'
                )
              }}
            >
              {I18n.t('Previous')}
            </Button>
            <Button
              margin="small"
              color="primary"
              type="submit"
              onClick={() => {
                dynamicRegistrationWizardState.transitionToConfirmationState(
                  state._type,
                  'PlacementsConfirmation'
                )
              }}
            >
              {I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'PlacementsConfirmation':
      return <div>Placements Confirmation</div>
    case 'NamingConfirmation':
      return <div>Naming Confirmation</div>
    case 'IconConfirmation':
      return <div>Icon Confirmation</div>
    case 'Reviewing':
      return <div>Reviewing</div>
    case 'DeletingDevKey':
      return <div>Deleting Dev Key</div>
    case 'Enabling':
      return <div>Enabling</div>
    case 'Error':
      return (
        <div>
          Error <pre>{state.error instanceof Error ? state.error.message : state.error}</pre>
        </div>
      )
  }
}

const addParams = (url: string, params: Record<string, string>) => {
  const u = new URL(url)
  Object.entries(params).forEach(([key, value]) => {
    u.searchParams.set(key, value)
  })
  return u.toString()
}
