import React from "react";

import StorePage from "../../src/pageComponents/storePage";
import { aura_header_theme } from "../../src/constants/config";

const ProductDetailsPage = (props) => (
	<StorePage
		isProductDetailPage
		{...props}
		serverData={{
			config: {
				aura_header_theme: aura_header_theme,
			},
		}}
	/>
);

export default ProductDetailsPage;

