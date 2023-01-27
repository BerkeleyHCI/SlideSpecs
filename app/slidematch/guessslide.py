import json, os, cv2, time, re, sys, string
import numpy as np
from scipy import spatial
import spacy

sys.path.append("image_text_reader/") 
import read_image as ri

nlp = spacy.load("en_core_web_sm") 
pattern = re.compile('[\W_]+')

def proportion_nonalphanumeric(s): 
    numbers = sum(c.isdigit() for c in s)
    words   = sum(c.isalpha() for c in s)
    spaces  = sum(c.isspace() for c in s)
    others  = len(s) - numbers - words - spaces
    return others / float(len(s)) if s else 0.0

def clean_text(s): 
    s = s.strip()
    l = s.split("\n")
    l = [k for k in l
           if len(k) > 0 
           and proportion_nonalphanumeric(k) < 0.3
           and len(''.join(k.split(" "))) > 2]
    l = [' '.join([pattern.sub('', m) for m in k.split(" ")]) for k in l]
    l = [" ".join(k.split()) for k in l]
    return l

def basic_words_in_common(words1, words2): 
    common_words = []
    for i in range(len(words1)): 
        for j in range(len(words2)): 
            if words1[i] == words2[j]: 
                common_words.append(words1[i])
    return list(set(common_words))

def flatten(l): 
    out = []
    for m in l: out += m
    return out

def text_match_score(l1, l2): 

    words_in_common = basic_words_in_common(flatten(l1), flatten(l2))
    total = len(list(set(flatten(l1) + flatten(l2))))
    
    if words_in_common: 
        return float(len(words_in_common)) / total
    else: 
        return 0.0

def best_text_match_from_image(image_fn, json_fn): 
    
    with open(json_fn) as fj: 
        j = json.load(fj)
        
    start = time.time()
    text = ri.read_image_from_file(image_fn)
    print("Read image time:", time.time() - start)
    
    start = time.time()
    clean_lines = [[m.lemma_ for m in nlp(k)] for k in clean_text(text)]
    clean_lines = [k for k in clean_lines if k]
    print("Clean text time:", time.time() - start)
    
    start = time.time()
    scores = []
    for key in j.keys(): 
        score = text_match_score(j[key], clean_lines)
        scores.append([key.split("/")[-1], score])
    print("Find match time:", time.time() - start)
    
    return sorted(scores, key=lambda x: -1.0*x[1])

def resize_image(img): 
    scale_percent = 50 # percent of original size
    width = int(img.shape[1] * scale_percent / 100)
    height = int(img.shape[0] * scale_percent / 100)
    dim = (width, height)
    resized = cv2.resize(img, dim, interpolation = cv2.INTER_AREA)
    return resized


def hist_match_score(d1, d2): 
    
    # comput match score for dictionary "g", "r", "b" of histograms
    color = ('b','g','r')
    vals = []
    
    for c in color: 
        lst1 = np.array([k[0] for k in d1[c]])
        lst2 = np.array([k[0] for k in d2[c]])

        vals += [spatial.distance.correlation(lst1, lst2)]
        
    return sum(vals)/float(len(vals))
        
def best_hist_match_from_image(image_fn, json_fn): 
    img = cv2.imread(image_fn)
    img = resize_image(img)
    color = ('b','g','r')
    new_dict = {}
    for i,col in enumerate(color):
        histr = cv2.calcHist([img],[i],None,[256],[0,256])
        new_dict[col] = histr.tolist()
        
    scores = []
    
    with open(json_fn) as f: 
        j = json.load(f)
        for key in j.keys(): 
            score =  hist_match_score(new_dict, j[key])
            scores.append([key, score])
    return sorted(scores, key=lambda x: x[1])

# return everything pretty similar to winning
def similar_scores(scores, threshold=0.0001): 
    similar = []
    for i in range(1, len(scores)): 
      if scores[i][1] - scores[0][1] < threshold: 
        similar.append(scores[i])
    return similar

def best_match(slide_screenshot_fn, text_json_fn, hist_json_fn, prior_slide_n): 
  overall_start = time.time()

  best_slide_n = None

  start = time.time()
  best_hist_matches = best_hist_match_from_image(slide_screenshot_fn, hist_json_fn)
  print("Histogram time:", time.time() - start)

  too_similar = [int(k[0]) for k in similar_scores(best_hist_matches)]

  best_slide_n = None

  # setup for later
  too_similar_in_range = [k for k 
    in range(prior_slide_n, prior_slide_n + 5) 
    if k in too_similar] if prior_slide_n else None

  if len(too_similar) == 0:
    print("Using histogram")
    best_slide_n = int(best_hist_matches[0][0])
    
    
  # we could just pick the closest (forward) slide
  # that falls within a given range (if one exists)
  elif too_similar_in_range:  
    print("Using histogram and prior slide")
    best_slide_n = sorted(too_similar_in_range, key = lambda x: x - prior_slide_n)[0]

  # or we could use text analysis 
  # takes longer, but likely accurate at this point
  else: 
    print("Using text match")
    start = time.time()
    best_text_matches = best_text_match_from_image(slide_screenshot_fn, text_json_fn)
    best_slide_n = int(best_text_matches[0][0])
    print("Text time:", time.time() - start)

  print("Total time:", time.time() - overall_start)
  
  print("Best matching slide:", best_slide_n)
  return best_slide_n

def main():
    # parse command line options
    args = sys.argv[1:]

    slide_screenshot_fn = args[0]
    text_json_fn = args[1]
    hist_json_fn = args[2]
    prior_slide_n = int(args[3]) if len(args) >= 4 else None

    best_slide_n = best_match(slide_screenshot_fn, text_json_fn, hist_json_fn, prior_slide_n)

    return best_slide_n

if __name__ == "__main__":
    main()

