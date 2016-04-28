package com.bestpay.builder;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;
import javax.crypto.spec.IvParameterSpec;
import java.io.UnsupportedEncodingException;
import java.security.Key;

public class Alg_3DesUtil {
	private static final String SECRET_KEY = "01020304050607080102030405060708";

	private static byte[] hexStringToBytes(String hexString) {
		if (hexString == null || hexString.equals("")) {
			return null;
		}
		hexString = hexString.toUpperCase();
		int length = hexString.length() / 2;
		char[] hexChars = hexString.toCharArray();
		byte[] d = new byte[length];
		for (int i = 0; i < length; i++) {
			int pos = i * 2;
			d[i] = (byte) (charToByte(hexChars[pos]) << 4 | charToByte(hexChars[pos + 1]));
		}
		return d;
	}

	private static byte charToByte(char c) {
		return (byte) "0123456789ABCDEF".indexOf(c);
	}

	private static String byte2HexStr(byte[] b) {
		String stmp = "";
		StringBuilder sb = new StringBuilder("");
		for (int n = 0; n < b.length; n++) {
			stmp = Integer.toHexString(b[n] & 0xFF);
			sb.append((stmp.length() == 1) ? "0" + stmp : stmp);
		}
		return sb.toString().toUpperCase().trim();
	}

	private static byte[] dataAlign(byte[] source) {
		int m = source.length % 8;
		byte[] target = null;
		if (m == 0) {
			target = new byte[source.length];
			System.arraycopy(source, 0, target, 0, source.length);
		} else {
			target = new byte[source.length + (8 - m)];
			System.arraycopy(source, 0, target, 0, source.length);
			for (int i = 0; i < (8 - m); i++) {
				target[source.length + i] = 0x20;
			}
		}
		return target;
	}

	private static byte[] dataOXR(byte[] v1, byte[] v2) {
		byte[] ret = new byte[v1.length];
		for (int i = 0; i < v1.length; i++) {
			ret[i] = (byte) (v1[i] ^ v2[i]);
		}
		return ret;
	}

	private static String calcMac(String macSource) throws Exception {


		byte[] key = hexStringToBytes(SECRET_KEY);
		byte[] keyiv = { 0, 0, 0, 0, 0, 0, 0, 0 };
		byte[] data = macSource.getBytes("UTF-8");
		byte[] initdata = { 0, 0, 0, 0, 0, 0, 0, 0 };
		byte[] groupdata = { 0, 0, 0, 0, 0, 0, 0, 0 };
		byte[] xordata = { 0, 0, 0, 0, 0, 0, 0, 0 };
		byte[] desdata = null;
		byte[] alignData = dataAlign(data);

		int groupNum = alignData.length / 8;

		for (int i = 0; i < groupNum; i++) {
			System.arraycopy(alignData, i * 8, groupdata, 0, 8);
			xordata = dataOXR(groupdata, initdata);
			desdata = des3EncodeCBC(key, keyiv, xordata);
			System.arraycopy(desdata, 0, initdata, 0, 8);
		}

		byte[] result = { 0, 0, 0, 0 };
		System.arraycopy(desdata, 0, result, 0, 4);

		String byte2HexStr = byte2HexStr(result);
		return byte2HexStr;
	}

	private static byte[] des3EncodeCBC(byte[] key, byte[] keyiv, byte[] data)
			throws Exception {

		Key deskey = null;
		DESKeySpec spec = new DESKeySpec(key);
		SecretKeyFactory keyfactory = SecretKeyFactory.getInstance("des");
		deskey = keyfactory.generateSecret(spec);

		Cipher cipher = Cipher.getInstance("des" + "/CBC/NoPadding");
		IvParameterSpec ips = new IvParameterSpec(keyiv);
		cipher.init(Cipher.ENCRYPT_MODE, deskey, ips);
		byte[] bOut = cipher.doFinal(data);

		return bOut;
	}

	private static byte[] des3DecodeCBC(byte[] key, byte[] keyiv, byte[] data)
			throws Exception {

		Key deskey = null;
		DESKeySpec spec = new DESKeySpec(key);
		SecretKeyFactory keyfactory = SecretKeyFactory.getInstance("des");
		deskey = keyfactory.generateSecret(spec);

		Cipher cipher = Cipher.getInstance("des" + "/CBC/NoPadding");
		IvParameterSpec ips = new IvParameterSpec(keyiv);
		cipher.init(Cipher.DECRYPT_MODE, deskey, ips);
		byte[] bOut = cipher.doFinal(data);

		return bOut;

	}

	public static String calc3Des(String macSource) {

		String byte2HexStr = null;
		try {
			byte[] key = hexStringToBytes(SECRET_KEY);
			byte[] keyiv = { 0, 0, 0, 0, 0, 0, 0, 0 };
			byte[] data = macSource.getBytes("UTF-8");
			byte[] groupdata = { 0, 0, 0, 0, 0, 0, 0, 0 };
			byte[] xordata = { 0, 0, 0, 0, 0, 0, 0, 0 };
			byte[] desdata = { 0, 0, 0, 0, 0, 0, 0, 0 };
			byte[] alignData = dataAlign(data);
			byte[] temp = new byte[alignData.length];

			int groupNum = alignData.length / 8;
			for (int i = 0; i < groupNum; i++) {
				System.arraycopy(alignData, i * 8, groupdata, 0, 8);
				xordata = dataOXR(groupdata, desdata);
				desdata = des3EncodeCBC(key, keyiv, xordata);

				System.arraycopy(desdata, 0, temp, i * 8, 8);
			}
			byte2HexStr = byte2HexStr(temp);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return byte2HexStr;
	}
}