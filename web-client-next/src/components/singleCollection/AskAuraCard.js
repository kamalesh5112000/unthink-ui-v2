import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import styles from "./AskAuraCard.module.css";

import { setShowChatModal } from "../../hooks/chat/redux/actions";
import { getCurrentTheme } from "../../helper/utils";
import { useRouter } from "next/router";

// import auraImageRound from "../../images/chat/aura-image-round.png";

const AskAuraCard = ({ size = "medium" }) => {
	const router = useRouter()
	const dispatch = useDispatch();

	const handleTileClick = useCallback(() => {
		// perform chat click on header // open chat on header
		router.push('/search')
		
	}, []);

	return (
		<div className={`${getCurrentTheme()} ${styles.cardWrapper}`}>
			<div
				className={`${styles.cardInner} ${size === "small" ? styles.innerSmall : styles.innerMedium
					}`}
				onClick={handleTileClick}>
				{/* <img src={auraImageRound} /> */}
				<div className={styles.contentWrapper}>
					<p className={styles.textSmall}>Want to find more products?</p>
					<p className={styles.textLarge}>Ask Aura</p>
				</div>
			</div>
		</div>
	);
};

export default React.memo(AskAuraCard);
