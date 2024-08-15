# frozen_string_literal: true

#
# Copyright (C) 2024 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

#
# some if the specs in here include "ignore_js_errors: true". This is because
# console errors are emitted for things that aren't really errors, like react
# jsx attribute type warnings
#

# rubocop:disable Specs/NoNoSuchElementError, Specs/NoExecuteScript
require_relative "../common"
require_relative "pages/block_editor_page"

describe "Block Editor", :ignore_js_errors do
  include_context "in-process server selenium tests"
  include BlockEditorPage

  let(:block_page_content) do
    '{
  "ROOT": {
    "type": {
      "resolvedName": "PageBlock"
    },
    "isCanvas": true,
    "props": {},
    "displayName": "Page",
    "custom": {},
    "hidden": false,
    "nodes": [
      "UO_WRGQgSQ"
    ],
    "linkedNodes": {}
  },
  "UO_WRGQgSQ": {
    "type": {
      "resolvedName": "BlankSection"
    },
    "isCanvas": false,
    "props": {},
    "displayName": "Blank Section",
    "custom": {
      "isSection": true
    },
    "parent": "ROOT",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {
      "blank-section_nosection1": "e33NpD3Ck3"
    }
  },
  "e33NpD3Ck3": {
    "type": {
      "resolvedName": "NoSections"
    },
    "isCanvas": true,
    "props": {
      "className": "blank-section__inner"
    },
    "displayName": "NoSections",
    "custom": {
      "noToolbar": true
    },
    "parent": "UO_WRGQgSQ",
    "hidden": false,
    "nodes": [],
    "linkedNodes": {}
  }
}'
  end

  before do
    course_with_teacher_logged_in
    @course.account.enable_feature!(:block_editor)
    @context = @course
    @rce_page = @course.wiki_pages.create!(title: "RCE Page", body: "RCE Page Body")
    @block_page = @course.wiki_pages.create!(title: "Block Page")
    puts ">>>", block_page_content
    @block_page.update!(
      block_editor_attributes: {
        time: Time.now.to_i,
        version: "1",
        blocks: [
          {
            data: block_page_content
          }
        ]
      }
    )
  end

  def create_wiki_page(course)
    get "/courses/#{course.id}/pages"
    f("a.new_page").click
    wait_for_block_editor
  end

  context "Create new page" do
    before do
      create_wiki_page(@course)
    end

    context "Start from Scratch" do
      it "walks through the stepper" do
        expect(stepper_modal).to be_displayed
        stepper_start_from_scratch.click
        stepper_next_button.click
        expect(stepper_select_page_sections).to be_displayed
        stepper_hero_section_checkbox.click
        stepper_next_button.click
        expect(stepper_select_color_palette).to be_displayed
        stepper_next_button.click
        expect(stepper_select_font_pirings).to be_displayed
        stepper_start_creating_button.click
        expect(f("body")).not_to contain_css(stepper_modal_selector)
        expect(f(".hero-section")).to be_displayed
      end
    end

    context "Start from Template" do
      it "walks through the stepper" do
        expect(stepper_modal).to be_displayed
        stepper_start_from_template.click
        stepper_next_button.click
        f("#template-1").click
        stepper_start_editing_button.click
        expect(f("body")).not_to contain_css(stepper_modal_selector)
        expect(f(".hero-section")).to be_displayed
      end
    end
  end

  context "Edit a page" do
    it "edits an rce page with the rce" do
      get "/courses/#{@course.id}/pages/#{@rce_page.url}/edit"
      wait_for_rce
      expect(f("textarea.body").attribute("value")).to eq("<p>RCE Page Body</p>")
    end

    it "edits a block page with the block editor" do
      get "/courses/#{@course.id}/pages/#{@block_page.url}/edit"
      wait_for_block_editor
      expect(f(".page-block")).to be_displayed
    end

    it "can drag and drop blocks from the toolbox" do
      get "/courses/#{@course.id}/pages/#{@block_page.url}/edit"
      wait_for_block_editor
      block_toolbox_toggle.click
      expect(block_toolbox).to be_displayed
      drag_and_drop_element(f(".toolbox-item.item-button"), f(".blank-section__inner"))
      expect(fj(".blank-section a:contains('Click me')")).to be_displayed
    end
  end
end

# rubocop:enable Specs/NoNoSuchElementError, Specs/NoExecuteScript
