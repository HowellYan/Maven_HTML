package com.bestpay.builder;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class Alg_MD5Util {

	static final String TAG = Alg_MD5Util.class.getSimpleName();
	private static MessageDigest md5;
	static {
		try {
			md5 = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 计算byte数组MD5
	 * 
	 * @param data
	 *            byte[]
	 * @return
	 */
	private static byte[] calcMD5(byte[] data) {

		return md5.digest(data);
	}

	/**
	 * 计算文件MD5
	 * 
	 * @param fileName
	 * @return
	 */
	private static byte[] calcFileMD5Bytes(String fileName) {
		FileInputStream fis = null;
		ByteArrayOutputStream bos = null;
		try {
			fis = new FileInputStream(fileName);
			bos = new ByteArrayOutputStream(fis.available());

			int len = 0;
			byte[] b = new byte[1024];
			while ((len = fis.read(b)) > 0) {

				bos.write(b, 0, len);
			}

			return calcMD5(bos.toByteArray());
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (fis != null) {
				try {
					fis.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}

			if (bos != null) {
				try {
					bos.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return null;
	}

	/**
	 * 计算文件MD5，若路径为文件夹，则返回结果是所有文件的MD5数组的集合
	 * 
	 * @param path
	 * @return
	 */
	private static String calcMD5(String path, String filteName) {
		File file = new File(path);
		if (!file.exists()) {
			return "";
		}

		if (file.isFile()) {
			if (!file.getName().equals(filteName)) {

				byte[] calcFileMD5 = calcFileMD5Bytes(path);

				return byte2HexStr(calcFileMD5);
			} else {
				return "";
			}
		} else {
			List<String> md5s = calcDirMd5s(file,filteName);
			Collections.sort(md5s);

			StringBuilder builder = new StringBuilder();
			for (String string : md5s) {
				builder.append(string);
			}

			return byte2HexStr(calcMD5(builder.toString().getBytes()));
		}

	}

	private static List<String> calcDirMd5s(File dir, String filteName) {
		List<String> md5s = new ArrayList<String>();

		if (dir.exists() && dir.isDirectory()) {
			
			File[] listFiles = dir.listFiles();
			
			for (int i = 0; i < listFiles.length; i++) {
				
				File file = listFiles[i];
				
				if (file.isFile()) {
					
					//不是过滤文件
					if (!file.getName().equals(filteName)) {

						String fileMD5Str = byte2HexStr(calcFileMD5Bytes(file
								.getAbsolutePath()));
						md5s.add(fileMD5Str);
					}else{
						
						//do nothing.
					}
				} else {
					
					//递归计算文件夹
					List<String> calcDirMd5s = calcDirMd5s(file, filteName);
					md5s.addAll(calcDirMd5s);
				}
			}
		}
		return md5s;

	}

	/**
	 * 计算文件（文件夹）的MD5值
	 * 
	 * @param path
	 * @return
	 */
	public static String calcMD5Str(String path, String filteName) {
		return calcMD5(path, filteName);
	}

	private static String byte2HexStr(byte[] b) {
		String stmp = "";
		StringBuilder sb = new StringBuilder("");
		for (int n = 0; n < b.length; n++) {
			stmp = Integer.toHexString(b[n] & 0xFF);
			sb.append((stmp.length() == 1) ? "0" + stmp : stmp);
		}
		return sb.toString().trim();
	}

}
