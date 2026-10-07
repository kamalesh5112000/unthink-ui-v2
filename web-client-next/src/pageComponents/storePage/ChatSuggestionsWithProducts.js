import React from "react";
import Slider from "react-slick";
import { Typography, Skeleton } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import { setSuggestionsSelectedTag } from "../../hooks/chat/redux/actions";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const { Title } = Typography;

const CustomArrow = (props) => {
	const { className, style, onClick, image } = props;
	return (
		<div
			className={`${className} slider-custom-arrow flex items-center text-black-200`}
			style={{ ...style, display: "block" }}
			onClick={onClick}>
			{image}
		</div>
	);
};

const ChatSuggestionsWithProducts = ({ wrapperClassName = "" }) => {
	const [suggestions] = useSelector((state) => [state.chatV2.suggestions]);
	const {
		suggestions: { tags = [] },
		selectedTag,
		products: suggestionsProducts,
	} = suggestions;

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

	const dispatch = useDispatch();

	const handleSuggestionClick = (suggestion) => {
		dispatch(setSuggestionsSelectedTag(suggestion));
	};

	const tagsProductsFetched = tags.filter((tag) => !!suggestionsProducts[tag]);

	const checkIsTagEnabled = (tag) => tagsProductsFetched.includes(tag);

	return (
		<div
			className={`w-full px-10 lg:px-0 mx-auto ${wrapperClassName}`}>
			<Slider {...sliderSettings}>
				{tags?.map((suggestion) => (
					<div
						key={suggestion}
						className={`relative rounded-full shadow mx-2 my-1 w-max ${
							suggestion === selectedTag
								? "bg-slate-400"
								: checkIsTagEnabled(suggestion)
								? "bg-gray-100"
								: "bg-white"
						} ${
							checkIsTagEnabled(suggestion)
								? "cursor-pointer"
								: "cursor-not-allowed"
						}`}
						onClick={() =>
							checkIsTagEnabled(suggestion) && handleSuggestionClick(suggestion)
						}>
						<Title
							level={5}
							className={`m-0 px-2 sm:px-4 py-1 font-normal text-xs md:text-sm ${
								suggestion === selectedTag ? "text-white" : "text-black-103"
							}`}>
							{suggestion}
						</Title>
						{!checkIsTagEnabled(suggestion) ? (
							<Skeleton.Button
								className='absolute top-0 h-full w-full'
								active
								shape='round'
								block
							/>
						) : null}
					</div>
				))}
			</Slider>
		</div>
	);
};

export default ChatSuggestionsWithProducts;
