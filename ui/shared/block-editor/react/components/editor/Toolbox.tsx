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
// components/Toolbox.js
import React, {useCallback, useEffect, useState} from 'react'
import {Element, useEditor} from '@craftjs/core'

import {CloseButton} from '@instructure/ui-buttons'
import {Flex} from '@instructure/ui-flex'
import {Tabs} from '@instructure/ui-tabs'
import {Text} from '@instructure/ui-text'
import {Tray} from '@instructure/ui-tray'
import {View, type ViewOwnProps} from '@instructure/ui-view'
import {SVGIcon} from '@instructure/ui-svg-images'

// import {Container, ContainerIcon} from '../user/blocks/Container'
import {ButtonBlock, ButtonBlockIcon} from '../user/blocks/ButtonBlock'
import {TextBlock, TextBlockIcon} from '../user/blocks/TextBlock'
import {HeadingBlock, HeadingBlockIcon} from '../user/blocks/HeadingBlock'
import {ResourceCard, ResourceCardIcon} from '../user/blocks/ResourceCard'
import {ImageBlock, ImageBlockIcon} from '../user/blocks/ImageBlock'
import {IconBlock, IconBlockIcon} from '../user/blocks/IconBlock'
import {IframeBlock, IframeBlockIcon} from '../user/blocks/IframeBlock'
import {RCEBlock, RCEBlockIcon} from '../user/blocks/RCEBlock'

import {ResourcesSection, ResourcesSectionIcon} from '../user/sections/ResourcesSection'
import {ColumnsSection, ColumnsSectionIcon} from '../user/sections/ColumnsSection'
import {HeroSection} from '../user/sections/HeroSection'
import {NavigationSection, NavigationSectionIcon} from '../user/sections/NavigationSection'
import {AboutSection, AboutSectionIcon} from '../user/sections/AboutSection'
import {QuizSection, QuizSectionIcon} from '../user/sections/QuizSection'
import {FooterSection, FooterSectionIcon} from '../user/sections/FooterSection'
import {BlankSection, BlankSectionIcon} from '../user/sections/BlankSection'

import {getTrayHeight} from '../../utils'

type ToolboxProps = {
  open: boolean
  onClose: () => void
}

export const Toolbox = ({open, onClose}: ToolboxProps) => {
  const {connectors} = useEditor()
  const [activeTab, setActiveTab] = useState(1)
  const [trayRef, setTrayRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // if (!hasOpened) return

    if (open && trayRef) {
      const ed = document.querySelector('.block-editor-editor') as HTMLElement | null
      if (!ed) return

      const ed_rect = ed.getBoundingClientRect()
      const tray_left = window.innerWidth - trayRef.offsetWidth
      if (ed_rect.right > tray_left) {
        ed.style.width = `${ed_rect.width - (ed_rect.right - tray_left)}px`
      }
    } else {
      const ed = document.querySelector('.block-editor-editor') as HTMLElement | null
      if (!ed) return
      ed.style.width = ''
    }
  }, [open, trayRef])

  const handleTabChange = useCallback(
    (
      _event: React.MouseEvent<ViewOwnProps> | React.KeyboardEvent<ViewOwnProps>,
      tabData: {index: number; id?: string}
    ) => {
      setActiveTab(tabData.index)
    },
    []
  )

  const handleCloseTray = useCallback(() => {
    onClose()
  }, [onClose])

  const renderBox = (label: string, icon: string, element: JSX.Element) => {
    return (
      <View
        shadow="resting"
        className="toolbox-item"
        textAlign="center"
        elementRef={(ref: Element | null) => ref && connectors.create(ref as HTMLElement, element)}
      >
        <Flex
          direction="column"
          justifyItems="center"
          alignItems="center"
          width="78px"
          height="78px"
        >
          <SVGIcon src={icon} size="x-small" />
          <Text size="small">{label}</Text>
        </Flex>
      </View>
    )
  }

  return (
    <Tray
      contentRef={el => setTrayRef(el)}
      label="Toolbox"
      open={open}
      placement="end"
      size="small"
      onClose={handleCloseTray}
    >
      <Flex direction="column" height={getTrayHeight()}>
        <Flex.Item shouldGrow={true} shouldShrink={true}>
          <CloseButton placement="end" onClick={handleCloseTray} screenReaderLabel="Close" />
          <Tabs onRequestTabChange={handleTabChange}>
            <Tabs.Panel renderTitle="Blocks" isSelected={activeTab === 0}>
              <Flex
                gap="x-small"
                justifyItems="space-between"
                alignItems="center"
                wrap="wrap"
                padding="x-small"
              >
                {renderBox('Button', ButtonBlockIcon, <ButtonBlock text="Click me" />)}
                {renderBox('Text', TextBlockIcon, <TextBlock text="" />)}
                {renderBox('RCE', RCEBlockIcon, <RCEBlock text="" />)}
                {/* renderBox(
                  'Container',
                  ContainerIcon,
                  <Element is={Container} background="#fff" canvas={true} layout="row" />
                ) */}
                {renderBox('Icon', IconBlockIcon, <IconBlock iconName="apple" />)}
                {renderBox('Heading', HeadingBlockIcon, <HeadingBlock />)}
                {renderBox('Resource Card', ResourceCardIcon, <ResourceCard />)}
                {renderBox('Image', ImageBlockIcon, <ImageBlock />)}
                {renderBox('Iframe', IframeBlockIcon, <IframeBlock />)}
              </Flex>
            </Tabs.Panel>
            <Tabs.Panel renderTitle="Sections" isSelected={activeTab === 1}>
              <Flex
                gap="x-small"
                justifyItems="space-between"
                alignItems="center"
                wrap="wrap"
                width="320px"
                padding="x-small"
              >
                {renderBox('Resources', ResourcesSectionIcon, <ResourcesSection />)}
                {renderBox(
                  'Columns',
                  ColumnsSectionIcon,
                  <ColumnsSection columns={2} variant="fixed" />
                )}
                {renderBox('Blank', BlankSectionIcon, <BlankSection />)}
                {renderBox('Hero', ImageBlockIcon, <HeroSection />)}
                {renderBox('Navigation', NavigationSectionIcon, <NavigationSection />)}
                {renderBox('About', AboutSectionIcon, <AboutSection />)}
                {renderBox('Quiz', QuizSectionIcon, <QuizSection />)}
                {renderBox('Footer', FooterSectionIcon, <FooterSection />)}
              </Flex>
            </Tabs.Panel>
          </Tabs>
        </Flex.Item>
      </Flex>
    </Tray>
  )
}
