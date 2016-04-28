package com.bestpay.builder;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

public class MenefestWriter {
	static final String MD5_KEY = "MD5";
	static final String MANIFEST = "MANIFEST.properties";

	public static boolean write(String appPath, String md5) {
		Properties properties = new Properties();
		try {
			File file = new File(appPath, MANIFEST);
			FileInputStream in = new FileInputStream(file);
			properties.load(in);
			in.close();
			String property = properties.getProperty(MD5_KEY);
			System.out.println("original md5:"+property);
			properties.remove(MD5_KEY);
			properties.put(MD5_KEY, md5);
			boolean delete = file.delete();
			System.out.println(delete);
			FileOutputStream out = new FileOutputStream(file);
			properties.store(out,null);
			out.close();
			return true;
		} catch (IOException e) {
			e.printStackTrace();
		}
		return false;
	}

	public static String generate(String appPath) {
		if (!new File(appPath).exists()) {
			return null;
		}
		String md5 = Alg_MD5Util.calcMD5Str(appPath, MANIFEST);
		String result3Des = Alg_3DesUtil.calc3Des(md5);
		write(appPath, result3Des);
		return result3Des;
	}
}
