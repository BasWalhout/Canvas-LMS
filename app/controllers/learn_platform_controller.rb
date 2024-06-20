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

class LearnPlatformController < ApplicationController
  def learnplatform_api
    @learnplatform_api ||= LearnPlatform::Api.new(@context)
  end

  def index
    options = {
      q: params[:q],
      page: params[:page],
      per_page: params[:per_page],
      filters: params[:filters]
    }

    response = learnplatform_api.products(options) || {}
    render json: response
  end

  def index_by_category
    response = learnplatform_api.products_by_category || {}
    render json: response
  end

  def show
    response = learnplatform_api.product(params[:id]) || {}
    render json: response
  end

  def filters
    response = learnplatform_api.product_filters || {}
    render json: response
  end
end
