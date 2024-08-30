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

import React, {useCallback, useContext, useState} from 'react'
import {useNode, type Node} from '@craftjs/core'

import {Button, IconButton} from '@instructure/ui-buttons'
import {Flex} from '@instructure/ui-flex'
import {Menu, type MenuItemProps, type MenuItem} from '@instructure/ui-menu'
import {Text} from '@instructure/ui-text'
import {IconArrowOpenDownLine, IconUploadLine} from '@instructure/ui-icons'
import {type ViewOwnProps} from '@instructure/ui-view'

import {IconSizePopup} from './ImageSizePopup'
import {
  EMPTY_IMAGE_WIDTH,
  EMPTY_IMAGE_HEIGHT,
  type ImageBlockProps,
  type ImageConstraint,
} from './types'
import {AddImageModal} from '../../../editor/AddImageModal'
import {useScope as useI18nScope} from '@canvas/i18n'

const I18n = useI18nScope('block-editor/image-block')

const ImageBlockToolbar = () => {
  const {
    actions: {setProp},
    node,
    props,
  } = useNode((n: Node) => ({
    props: n.data.props,
    node: n,
  }))
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleConstraintChange = useCallback(
    (
      e: React.MouseEvent<ViewOwnProps, MouseEvent>,
      value: MenuItemProps['value'] | MenuItemProps['value'][],
      _selected: MenuItemProps['selected'],
      _args: MenuItem
    ) => {
      const constraint = value as ImageConstraint | 'aspect-ratio'
      if (constraint === 'aspect-ratio') {
        setProp((prps: ImageBlockProps) => {
          prps.constraint = 'cover'
          prps.maintainAspectRatio = true
        })
      } else {
        setProp((prps: ImageBlockProps) => {
          prps.constraint = constraint
          prps.maintainAspectRatio = false
        })
      }
    },
    [setProp]
  )

  const handleShowUploadModal = useCallback(() => {
    setShowUploadModal(true)
  }, [])

  const handleDismissModal = useCallback(() => {
    setShowUploadModal(false)
  }, [])

  const handleSave = useCallback(
    (imageURL: string | null) => {
      setProp((prps: ImageBlockProps) => {
        prps.src = imageURL || undefined
        // make sure the width and height are set to constrain the size of the new image
        if (node.dom && (!props.width || !props.height)) {
          const {width, height} = node.dom.getBoundingClientRect()
          prps.width = width
          prps.height = height
        }
      })
      setShowUploadModal(false)
    },
    [node.dom, props.height, props.width, setProp]
  )

  const handleChangeSz = useCallback(
    (width: number, height: number) => {
      setProp((prps: ImageBlockProps) => {
        prps.width = width
        prps.height = height
      })
    },
    [setProp]
  )

  return (
    <Flex gap="small">
      <IconButton
        screenReaderLabel={I18n.t('Upload Image')}
        withBackground={false}
        withBorder={false}
        onClick={handleShowUploadModal}
        data-testid="upload-image-button"
      >
        <IconUploadLine size="x-small" />
      </IconButton>
      <Menu
        label={I18n.t('Constraint')}
        trigger={
          <Button size="small">
            <Flex gap="small">
              <Text size="small">Constraint</Text>
              <IconArrowOpenDownLine size="x-small" />
            </Flex>
          </Button>
        }
      >
        <Menu.Item
          type="checkbox"
          value="cover"
          onSelect={handleConstraintChange}
          selected={!props.maintainAspectRatio && props.constraint === 'cover'}
        >
          <Text size="small">{I18n.t('Cover')}</Text>
        </Menu.Item>
        <Menu.Item
          type="checkbox"
          value="contain"
          onSelect={handleConstraintChange}
          selected={!props.maintainAspectRatio && props.constraint === 'contain'}
        >
          <Text size="small">{I18n.t('Contain')}</Text>
        </Menu.Item>
        <Menu.Item
          type="checkbox"
          value="aspect-ratio"
          onSelect={handleConstraintChange}
          selected={props.maintainAspectRatio}
        >
          <Text size="small">{I18n.t('Match Aspect Ratio')}</Text>
        </Menu.Item>
      </Menu>

      <IconSizePopup
        width={props.width || EMPTY_IMAGE_WIDTH}
        height={props.height || EMPTY_IMAGE_HEIGHT}
        maintainAspectRatio={props.maintainAspectRatio}
        onChange={handleChangeSz}
      />
      <AddImageModal open={showUploadModal} onSubmit={handleSave} onDismiss={handleDismissModal} />
    </Flex>
  )
}

export {ImageBlockToolbar}
