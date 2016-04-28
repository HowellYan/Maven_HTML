package com.bestpay.builder;

import java.io.File;

/**
 * Created by Howell on 16/4/28.
 */
public class MainToDir {
    static UI ui;
    static File selectFile;
    static final String MANIFEST = "MANIFEST.properties";
    static final String MD5_KEY = "MD5";

    public static void main(String[] args) {
        MainToDir mainToDir = new MainToDir();
        mainToDir.getFilesPath();
    }
    public void getFilesPath(){
        String rootPath = System.getProperty("user.dir");
        File file = new File(rootPath + "/target");
        if (file.isDirectory()){
            String[] filelist = file.list();
            for (int i = 0; i < filelist.length; i++) {
                System.out.println("path=" + filelist[i]);
                if(filelist[i].toString().indexOf("offline_H5-") == 0){
                    md5Path(rootPath + "/target/"+filelist[i]);
                }
            }
            System.out.print(rootPath);
        }
    }

    public void md5Path(String path){
        String generate = MenefestWriter.generate(path);
        System.out.println(path);
        System.out.println(generate);
    }


}
