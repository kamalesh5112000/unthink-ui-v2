import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { Typography, Image } from "antd";
import { useSelector } from "react-redux";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const { Title } = Typography;

const CustomArrow = (props) => {
	const { className, style, onClick, image } = props;
	return (
		<div
			className={`${className} slider-custom-arrow flex items-center text-black-200 dark:text-white`}
			style={{ ...style, display: "block" }}
			onClick={onClick}>
			{image}
		</div>
	);
};

const ChatSuggestionsV2 = ({ onSuggestionClick, wrapperClassName = "" }) => {
	const [selectedChip, setSelectedChip] = useState("");
	const [chatGeneralSuggestions, widgetHeader, chatProducts] = useSelector(
		(state) => [
			state.chatV2.chatGeneralSuggestions,
			state.chatV2.widgetHeader,
			state.chatV2.products,
		]
	);

	useEffect(() => {
		return () => {
			setSelectedChip("");
		};
	}, []);

	useEffect(() => {
		setSelectedChip("");
	}, [chatGeneralSuggestions]);

	useEffect(() => {
		if (chatProducts && chatProducts.selected_suggestion_chip) {
			setSelectedChip(chatProducts.selected_suggestion_chip);
		}
	}, [chatProducts]);

	const sliderSettings = {
		className: "w-full px-4 chat-suggestions-slider",
		dots: false,
		infinite: false,
		centerMode: false,
		slidesToShow: 1,
		slidesToScroll: 1,
		variableWidth: true,
		arrows: true,
		nextArrow: <CustomArrow image={<RightOutlined />} />,
		prevArrow: <CustomArrow image={<LeftOutlined />} />,
	};

	const handleSuggestionClick = (suggestion) => {
		const metadata = {
			search: true,
			search_suggestions: chatGeneralSuggestions && [...chatGeneralSuggestions],
			widgetHeader,
			selected_suggestion_chip: suggestion,
		};
		setSelectedChip(suggestion);
		onSuggestionClick(suggestion, metadata);
	};

	return (
		<div className={`px-10 lg:px-0 w-full mx-auto ${wrapperClassName}`}>
			<Slider {...sliderSettings}>
				{chatGeneralSuggestions?.map((suggestion) => (
					<div
						key={suggestion}
						className={`cursor-pointer rounded-full shadow mx-2 my-1 w-max ${
							suggestion === selectedChip
								? " bg-slate-400"
								: " bg-gray-100"
						}`}
						onClick={() => handleSuggestionClick(suggestion)}>
						<Title
							level={5}
							className={`m-0 px-2 sm:px-4 py-1 font-normal text-xs md:text-sm ${
								suggestion === selectedChip ? "text-white" : "text-black-103"
							}`}>
							{suggestion}
						</Title>
					</div>
				))}
			</Slider>
		</div>
	);
};

export default ChatSuggestionsV2;
