package com.bestpay.builder;

import java.io.File;


public interface UiListener {
	void onClick(String path);
	
	void onSelect(File file);
}
