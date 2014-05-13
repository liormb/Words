class WordsController < ApplicationController
	def index
		response = HTTParty.get(params[:url])
		render text: response.body
	end
end