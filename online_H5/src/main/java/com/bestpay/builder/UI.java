package com.bestpay.builder;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;

public class UI {
	
	private UiListener listener;
	private javax.swing.JTextField md5ResultText;
	private javax.swing.JFrame jf;

	public UI(UiListener listener) {
		super();
		this.listener = listener;
	}


	public void setMd5(String md5){
		md5ResultText.setText(md5);
	}
	
	public void showDialog(String message){
		JDialog jd = new JDialog(jf);
		jd.setLocation(450, 200);
		jd.setSize(message.length()*8, 50);
		java.awt.FlowLayout fl = new java.awt.FlowLayout();
		jd.setLayout(fl);
		JLabel jLabel = new JLabel(message);
		jd.add(jLabel );
		jd.setVisible(true);
	}

	public void initGUI() {
		jf = new javax.swing.JFrame();
		jf.setTitle("HTML5-MD5-BUILDER");
		jf.setSize(300, 150);
		jf.setLocation(450, 200);
		jf.setDefaultCloseOperation(3);
		jf.setResizable(false);

		java.awt.FlowLayout fl = new java.awt.FlowLayout();
		jf.setLayout(fl);
		JLabel jlaName = new JLabel(
				"                                          ");
		jf.add(jlaName);
		final javax.swing.JTextField dirPathText = new javax.swing.JTextField("Selected File path", 15);
		jf.add(dirPathText);

		JButton jb = new JButton("Browse");
		jb.addActionListener(new ActionListener() {

			public void actionPerformed(ActionEvent arg0) {
				JFileChooser j = new JFileChooser();
				j.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
				int option = j.showOpenDialog(jf);
				if (option == JFileChooser.APPROVE_OPTION) {
					File file = j.getSelectedFile();
					dirPathText.setText(file.getAbsolutePath());
					listener.onSelect(file);
				}	
			}
		});
		jf.add(jb);

		md5ResultText = new javax.swing.JTextField("MD5 3DES result", 24);
		jf.add(md5ResultText);
		JButton buildeBtn = new JButton("Generate");
		buildeBtn.addActionListener(new ActionListener() {
			

			public void actionPerformed(ActionEvent e) {
				listener.onClick(dirPathText.getText());
			}
		});
		jf.add(buildeBtn);

		jf.setVisible(true);
	}
	
	

}
