import React from "react";
import { Image } from "antd";

import header_aura from "../../../../../images/chat/header_aura_image.png";
import star_ai_icon_logo from "../../../../../images/unthink_star_ai_icon.svg";
import styles from "./MobileChat.module.css";


const MobileChat = ({ onChatClick }) => {
	return (
		<div onClick={onChatClick} className={styles.container}>
			<Image
				src={star_ai_icon_logo}
				className={styles.image}
				preview={false}
				width={30}
			/>
			<h1 className={styles.title}>Search</h1>
		</div>
	);
};

export default MobileChat;
