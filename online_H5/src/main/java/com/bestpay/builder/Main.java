package com.bestpay.builder;

import java.io.File;

public class Main {
	static UI ui;
	static File selectFile;
	static final String MANIFEST = "MANIFEST.properties";
	static final String MD5_KEY = "MD5";

	public static void main(String[] args) {
		UiListener listener = new UiListener() {
			public void onClick(final String path) {
				new Thread() {
					@Override
					public void run() {
						String generate = MenefestWriter.generate(path);
						ui.setMd5(generate);
						ui.showDialog(generate!=null?"success":"failure");
					}
				}.start();
			}

			public void onSelect(File file) {
				selectFile = file;
			}
		};
		ui = new UI(listener);
		ui.initGUI();
	}

	public String getPath(){
		String rootPath = System.getProperty("user.dir");
		System.out.print(rootPath);
		return rootPath;
	}
}
